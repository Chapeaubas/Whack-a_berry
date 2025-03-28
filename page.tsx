import ProfilePage from "@/components/profile-page"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function Profile() {
  return (
    <div className="container mx-auto py-4">
      <Link href="/">
        <Button variant="outline" className="mb-4 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Game
        </Button>
      </Link>

      <ProfilePage onBack={() => null} />
    </div>
  )
}

