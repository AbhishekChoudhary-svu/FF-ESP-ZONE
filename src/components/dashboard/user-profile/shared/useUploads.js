import { useToast } from "@/components/ui/GameToast";
import { useState } from "react";

export function useAvatarUpload(initialUrl = null) {
  const [avatar, setAvatar] = useState(initialUrl);
  const [avatarPreview, setAvatarPreview] = useState(initialUrl);
  const toast = useToast();

  const handleAvatarChange = async (file) => {
    try {
      setAvatarPreview(URL.createObjectURL(file));

      const fd = new FormData();
      fd.append("avatar", file);

      const res = await fetch("/api/uploads/avatar", {
        method: "POST",
        body: fd,
      });

      const { success, url, error } = await res.json();

      if (!success) {
        toast.error("Avatar Upload Failed", error || "Failed to upload avatar");
        return;
      }

      setAvatar(url);

      toast.team("Avatar Updated", "Profile avatar uploaded successfully");
    } catch (err) {
      toast.error("Upload Error", "Failed to upload avatar");
    }
  };

  const handleDeleteAvatar = async () => {
    if (!avatar) return;

    try {
      await fetch("/api/uploads/avatar", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarUrl: avatar,
        }),
      });

      setAvatar(null);
      setAvatarPreview(null);

      toast.team("Avatar Removed", "Profile avatar deleted successfully");
    } catch {
      toast.error("Delete Failed", "Failed to remove avatar");
    }
  };

  const reset = (url) => {
    setAvatar(url ?? null);
    setAvatarPreview(url ?? null);
  };

  return {
    avatar,
    avatarPreview,
    handleAvatarChange,
    handleDeleteAvatar,
    resetAvatar: reset,
  };
}

export function useClipPhotosUpload(initialUrls = []) {
  const [clipPhotos, setClipPhotos] = useState(initialUrls);
  const [clipPhotoPreviews, setClipPhotoPreviews] = useState(initialUrls);
  const toast = useToast();

  const handleClipPhotosChange = async (files) => {
    try {
      const selected = Array.from(files).slice(0, 2);

      setClipPhotoPreviews(selected.map((f) => URL.createObjectURL(f)));

      const fd = new FormData();
      selected.forEach((f) => fd.append("photos", f));

      const { success, urls, error } = await (
        await fetch("/api/uploads/photo", {
          method: "POST",
          body: fd,
        })
      ).json();

      if (!success) {
        toast.error("Upload Failed", error || "Failed to upload photos");
        return;
      }

      setClipPhotos(urls);

      toast.team("Photos Uploaded", "Clip photos uploaded successfully");
    } catch {
      toast.error("Upload Error", "Failed to upload photos");
    }
  };

  const handleDeletePhoto = async (index) => {
    try {
      await fetch("/api/uploads/photo", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          photoUrls: [clipPhotos[index]],
        }),
      });

      setClipPhotos((p) => p.filter((_, i) => i !== index));
      setClipPhotoPreviews((p) => p.filter((_, i) => i !== index));

      toast.team("Photo Removed", "Clip photo deleted successfully");
    } catch {
      toast.error("Delete Failed", "Failed to remove photo");
    }
  };

  const reset = (urls) => {
    setClipPhotos(urls ?? []);
    setClipPhotoPreviews(urls ?? []);
  };

  return {
    clipPhotos,
    clipPhotoPreviews,
    handleClipPhotosChange,
    handleDeletePhoto,
    resetClipPhotos: reset,
  };
}

export function useClipVideoUpload(initialUrl = null) {
  const [clipVideo, setClipVideo] = useState(initialUrl);
  const [clipVideoPreview, setClipVideoPreview] = useState(initialUrl);
  const toast = useToast();

  const handleClipVideoChange = async (file) => {
    try {
      setClipVideoPreview(URL.createObjectURL(file));

      const fd = new FormData();
      fd.append("video", file);

      const { success, url, error } = await (
        await fetch("/api/uploads/video", {
          method: "POST",
          body: fd,
        })
      ).json();

      if (!success) {
        toast.error("Video Upload Failed", error || "Failed to upload video");
        return;
      }

      setClipVideo(url);

      toast.team("Video Uploaded", "Clip video uploaded successfully");
    } catch {
      toast.error("Upload Error", "Failed to upload video");
    }
  };

  const handleDeleteVideo = async () => {
    if (!clipVideo) return;

    try {
      await fetch("/api/uploads/video", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: clipVideo,
        }),
      });

      setClipVideo(null);
      setClipVideoPreview(null);

      toast.team("Video Removed", "Clip video deleted successfully");
    } catch {
      toast.error("Delete Failed", "Failed to remove video");
    }
  };

  const reset = (url) => {
    setClipVideo(url ?? null);
    setClipVideoPreview(url ?? null);
  };

  return {
    clipVideo,
    clipVideoPreview,
    handleClipVideoChange,
    handleDeleteVideo,
    resetClipVideo: reset,
  };
}

export function useLogoUpload(initialUrl = null) {
  const [logo, setLogo] = useState(initialUrl);
  const [logoPreview, setLogoPreview] = useState(initialUrl);
  const toast = useToast();

  const handleLogoChange = async (file) => {
    setLogoPreview(URL.createObjectURL(file));
    const fd = new FormData();
    fd.append("logo", file);
    const res = await fetch("/api/uploads/logo", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) {
      toast.error(
        "Logo Upload Failed",
        data.message || "Failed to upload logo",
      );
      return;
    }
    setLogo(data.logoUrl);

    toast.team("Logo Uploaded", "Team logo uploaded successfully");
  };

  const removeLogo = async () => {
    if (!logo) return;

    try {
      await fetch("/api/uploads/logo", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logoUrl: logo,
        }),
      });

      setLogo(null);
      setLogoPreview(null);

      toast.team("Logo Removed", "Team logo deleted successfully");
    } catch {
      toast.error("Delete Failed", "Failed to remove logo");
    }
  };

  const reset = (url) => {
    setLogo(url ?? null);
    setLogoPreview(url ?? null);
  };

  return { logo, logoPreview, handleLogoChange, removeLogo, resetLogo: reset };
}
