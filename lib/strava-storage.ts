import { createClient as createBrowserClient } from './supabase/client';
import { createClient as createServerClient } from './supabase/server';

export interface StravaConnection {
  id: string;
  friend_id: string;
  athlete_id: number;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope: string;
  connected_at: string;
  last_sync_at?: string;
}

export interface StravaTokenResponse {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: {
    id: number;
    username?: string;
    firstname?: string;
    lastname?: string;
  };
}

export async function saveStravaConnection(
  friendId: string,
  tokenData: StravaTokenResponse
): Promise<StravaConnection | null> {
  const supabase = await createServerClient();

  const connection = {
    friend_id: friendId,
    athlete_id: tokenData.athlete.id,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: tokenData.expires_at,
    scope: 'read,activity:read_all',
  };

  const { data, error } = await supabase
    .from('strava_connections')
    .upsert(connection, { onConflict: 'friend_id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving Strava connection:', error);
    return null;
  }

  return data;
}

export async function getStravaConnection(
  friendId: string
): Promise<StravaConnection | null> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('strava_connections')
    .select('*')
    .eq('friend_id', friendId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function deleteStravaConnection(
  friendId: string
): Promise<boolean> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from('strava_connections')
    .delete()
    .eq('friend_id', friendId);

  return !error;
}

export async function refreshStravaToken(
  connection: StravaConnection
): Promise<StravaConnection | null> {
  const now = Math.floor(Date.now() / 1000);

  if (connection.expires_at > now + 300) {
    return connection;
  }

  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: connection.refresh_token,
      }),
    });

    if (!response.ok) {
      console.error('Failed to refresh Strava token:', await response.text());
      return null;
    }

    const tokenData: StravaTokenResponse = await response.json();

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('strava_connections')
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at,
      })
      .eq('friend_id', connection.friend_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating refreshed token:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error refreshing Strava token:', error);
    return null;
  }
}

export async function getValidStravaToken(
  friendId: string
): Promise<string | null> {
  let connection = await getStravaConnection(friendId);

  if (!connection) {
    return null;
  }

  const refreshed = await refreshStravaToken(connection);

  if (!refreshed) {
    return null;
  }

  return refreshed.access_token;
}

export async function updateLastSync(friendId: string): Promise<void> {
  const supabase = await createServerClient();

  await supabase
    .from('strava_connections')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('friend_id', friendId);
}
