// 'use client'
// import { useUser, useAuth } from '@clerk/nextjs'
// import { useEffect } from 'react'

// export default function UserSync() {
//   const { user } = useUser()
//   const { getToken } = useAuth()
  
//   useEffect(() => {
//     const syncUser = async () => {
//       if (user) {
//         try {
//           const token = await getToken()
//           console.log(token)
//           if (token) {
//             localStorage.setItem('token', token)
//           }
//           const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/users/sync', {
//             method: 'POST',
//             headers: {
//               'Authorization': `Bearer ${token}`,
//               'Content-Type': 'application/json'
//             }
//           })

//           if (!response.ok) {
//             console.error('Failed to sync user with backend')
//           }
//         } catch (error) {
//           console.error('Error syncing user:', error)
//         }
//       }
//     }

//     syncUser()
//   }, [user, getToken])

//   return null
// } 