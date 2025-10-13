// Script to update all friend PINs with unique random 4-digit numbers
// Run this once to generate new PINs for all friends

async function updateFriendPins() {
  const adminPin = "9406" // Superadmin PIN
  
  try {
    const response = await fetch("http://localhost:5000/api/admin/update-pins", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ adminPin }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log("✅ Success:", data.message)
      console.log("\n📋 Updated Friend PINs:")
      console.log("========================")
      data.updates.forEach((friend: any) => {
        console.log(`${friend.name}: ${friend.pin}${friend.isOwner ? " (Owner)" : ""}`)
      })
      console.log("\n💡 Save these PINs - friends will use them to login!")
    } else {
      console.error("❌ Error:", data.error)
    }
  } catch (error) {
    console.error("❌ Failed to update PINs:", error)
  }
}

updateFriendPins()
