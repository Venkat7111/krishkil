import { useState } from 'react'
import { Camera, Save, Trash2, LogOut } from 'lucide-react'
import ProfileCard from '@/components/cards/ProfileCard'
import Card from '@/components/common/Card'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/common/Toast'

export default function Profile() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold">Profile</h1>

      <Card leaf>
        <div className="flex items-center justify-between">
          <ProfileCard user={user} />
          <button className="p-2 rounded-lg hover:bg-current/5"><Camera className="w-5 h-5" /></button>
        </div>
      </Card>

      <Card>
        <h3 className="font-display font-semibold mb-4">Personal Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Full Name" defaultValue={user?.name} />
          <Input label="Email" defaultValue={user?.email} />
          <Input label="Phone Number" placeholder="+91" />
          <Input label="Preferred Language" defaultValue="English" />
        </div>
      </Card>

      <Card>
        <h3 className="font-display font-semibold mb-4">Farm Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Village" placeholder="Village name" />
          <Input label="District" placeholder="District" />
          <Input label="Land Size (acres)" placeholder="e.g. 3.5" />
          <Input label="Primary Crop" placeholder="e.g. Cotton" />
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button icon={Save} onClick={() => showToast('Profile updated', 'success')}>Save Changes</Button>
        <Button variant="outline">Change Password</Button>
        <Button variant="ghost" icon={LogOut} onClick={logout}>Logout</Button>
        <Button variant="ghost" icon={Trash2} className="text-red-500 ml-auto" onClick={() => setConfirmDelete(true)}>Delete Account</Button>
      </div>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete account?">
        <p className="text-sm text-current/70 mb-4">This action is permanent and cannot be undone. All your data will be removed.</p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button className="flex-1 !bg-red-500 hover:!bg-red-600" onClick={logout}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
