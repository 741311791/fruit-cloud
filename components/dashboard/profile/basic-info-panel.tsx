'use client'

import { useRef, useState } from 'react'
import { Upload, Mail, Phone, BadgeCheck } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CURRENT_USER } from '@/lib/current-user'

export function BasicInfoPanel() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [nickname, setNickname] = useState(CURRENT_USER.name)
  const [email, setEmail] = useState(CURRENT_USER.email)
  const [phone, setPhone] = useState(CURRENT_USER.phone)
  const fileRef = useRef<HTMLInputElement>(null)

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setAvatarUrl(URL.createObjectURL(file))
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base font-semibold text-foreground">基本资料</h3>
        <p className="mt-1 text-sm text-muted-foreground">管理你的头像、昵称与绑定的联系方式。</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <Avatar className="size-20">
          {avatarUrl && <AvatarImage src={avatarUrl || '/placeholder.svg'} alt="头像预览" />}
          <AvatarFallback className="bg-primary/12 text-xl font-semibold text-primary">
            {CURRENT_USER.initial}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1.5">
            <Upload className="size-4" />
            更换头像
          </Button>
          <p className="text-xs text-muted-foreground">支持 JPG / PNG，建议尺寸 200×200，大小不超过 2MB。</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid max-w-2xl gap-5">
        <div className="grid gap-2">
          <Label htmlFor="nickname">昵称</Label>
          <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} className="h-9" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="account">登录账号</Label>
          <Input id="account" value={CURRENT_USER.account} readOnly disabled className="h-9" />
          <p className="text-xs text-muted-foreground">登录账号由管理员分配，不可自行修改。</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">绑定邮箱</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9 pl-9" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 whitespace-nowrap">
              <BadgeCheck className="size-4" />
              验证换绑
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone">绑定手机号</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9 pl-9" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 whitespace-nowrap">
              <Phone className="size-4" />
              换绑手机
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 border-t border-border pt-5">
        <Button>保存修改</Button>
        <Button variant="ghost">取消</Button>
      </div>
    </div>
  )
}
