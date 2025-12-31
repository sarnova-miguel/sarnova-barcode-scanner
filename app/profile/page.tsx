"use client";

import PageTitle from '@/components/ui/PageTitle'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Building2, MapPin } from 'lucide-react'

const ProfilePage = () => {
  // Mock user data - in a real app, this would come from authentication/database
  const user = {
    name: "Fire Marshall Bill",
    email: "bill@fdny.com",
    company: "Fire Department of New York",
    location: "New York City, NY",
    image: "/fireman.jpg"
  }

  return (
    <section>
      <PageTitle>Profile</PageTitle>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Image */}
            <div className="flex justify-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200 shadow-lg">
                <Image
                  src={user.image}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-4">
              {/* Username */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Username</p>
                  <p className="text-base font-semibold text-gray-900">{user.name}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <p className="text-base font-semibold text-gray-900">{user.email}</p>
                </div>
              </div>

              {/* Company */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Company</p>
                  <p className="text-base font-semibold text-gray-900">{user.company}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Location</p>
                  <p className="text-base font-semibold text-gray-900">{user.location}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default ProfilePage