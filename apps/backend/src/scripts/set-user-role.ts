import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function setUserRole({ container }: ExecArgs) {
  const userService = container.resolve<any>(Modules.USER)
  
  const email = "manager@test.com"
  const role = "shop_manager"

  console.log(`Searching for user with email: ${email}...`)
  
  const users = await userService.listUsers({ email })
  if (users.length === 0) {
    console.error(`Error: User with email ${email} not found. Please run: npx medusa user -e ${email} -p your_password first.`)
    return
  }

  const user = users[0]
  console.log(`Found user: ${user.id}. Current metadata:`, user.metadata)

  const updatedUser = await userService.updateUsers({
    id: user.id,
    metadata: {
      ...user.metadata,
      role: role
    }
  })

  console.log(`Successfully updated role to '${role}' for ${email}!`)
}
