

import { useState } from "react"

export function useAvatarUpload(initialUrl = null) {
  const [avatar, setAvatar] = useState(initialUrl)
  const [avatarPreview, setAvatarPreview] = useState(initialUrl)

  const handleAvatarChange = async (file) => {
    setAvatarPreview(URL.createObjectURL(file))
    const fd = new FormData()
    fd.append("avatar", file)
    const res = await fetch("/api/uploads/avatar", { method: "POST", body: fd })
    const { success, url } = await res.json()
    if (success) setAvatar(url)
  }

  const handleDeleteAvatar = async () => {
    if (!avatar) return
    await fetch("/api/uploads/avatar", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: avatar }),
    })
    setAvatar(null)
    setAvatarPreview(null)
  }

  const reset = (url) => {
    setAvatar(url ?? null)
    setAvatarPreview(url ?? null)
  }

  return { avatar, avatarPreview, handleAvatarChange, handleDeleteAvatar, resetAvatar: reset }
}

export function useClipPhotosUpload(initialUrls = []) {
  const [clipPhotos, setClipPhotos] = useState(initialUrls)
  const [clipPhotoPreviews, setClipPhotoPreviews] = useState(initialUrls)

  const handleClipPhotosChange = async (files) => {
    const selected = Array.from(files).slice(0, 2)
    setClipPhotoPreviews(selected.map((f) => URL.createObjectURL(f)))
    const fd = new FormData()
    selected.forEach((f) => fd.append("photos", f))
    const { success, urls } = await (
      await fetch("/api/uploads/photo", { method: "POST", body: fd })
    ).json()
    if (success) setClipPhotos(urls)
  }

  const handleDeletePhoto = async (index) => {
    await fetch("/api/uploads/photo", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoUrls: [clipPhotos[index]] }),
    })
    setClipPhotos((p) => p.filter((_, i) => i !== index))
    setClipPhotoPreviews((p) => p.filter((_, i) => i !== index))
  }

  const reset = (urls) => {
    setClipPhotos(urls ?? [])
    setClipPhotoPreviews(urls ?? [])
  }

  return {
    clipPhotos,
    clipPhotoPreviews,
    handleClipPhotosChange,
    handleDeletePhoto,
    resetClipPhotos: reset,
  }
}

export function useClipVideoUpload(initialUrl = null) {
  const [clipVideo, setClipVideo] = useState(initialUrl)
  const [clipVideoPreview, setClipVideoPreview] = useState(initialUrl)

  const handleClipVideoChange = async (file) => {
    setClipVideoPreview(URL.createObjectURL(file))
    const fd = new FormData()
    fd.append("video", file)
    const { success, url } = await (
      await fetch("/api/uploads/video", { method: "POST", body: fd })
    ).json()
    if (success) setClipVideo(url)
  }

  const handleDeleteVideo = async () => {
    if (!clipVideo) return
    await fetch("/api/uploads/video", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoUrl: clipVideo }),
    })
    setClipVideo(null)
    setClipVideoPreview(null)
  }

  const reset = (url) => {
    setClipVideo(url ?? null)
    setClipVideoPreview(url ?? null)
  }

  return {
    clipVideo,
    clipVideoPreview,
    handleClipVideoChange,
    handleDeleteVideo,
    resetClipVideo: reset,
  }
}

export function useLogoUpload(initialUrl = null) {
  const [logo, setLogo] = useState(initialUrl)
  const [logoPreview, setLogoPreview] = useState(initialUrl)

  const handleLogoChange = async (file) => {
    setLogoPreview(URL.createObjectURL(file))
    const fd = new FormData()
    fd.append("logo", file)
    const res = await fetch("/api/uploads/logo", { method: "POST", body: fd })
    const data = await res.json()
    if (!res.ok) { alert(data.message || "Logo upload failed"); return }
    setLogo(data.logoUrl)
  }

  const removeLogo = async () => {
    if (!logo) return
    await fetch("/api/uploads/logo", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoUrl: logo }),
    })
    setLogo(null)
    setLogoPreview(null)
  }

  const reset = (url) => {
    setLogo(url ?? null)
    setLogoPreview(url ?? null)
  }

  return { logo, logoPreview, handleLogoChange, removeLogo, resetLogo: reset }
}