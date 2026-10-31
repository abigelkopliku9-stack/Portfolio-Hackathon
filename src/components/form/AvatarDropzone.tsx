"use client";

import { useCallback, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useT } from "@/components/LocaleProvider";

/**
 * Drag-and-drop avatar picker.
 *
 * Replaces the old "Avatar URL" text input: the user drags an image file
 * onto the dropzone (or clicks to browse), the file uploads to
 * POST /api/upload, and the returned URL is written to `profile.avatarUrl`.
 * A previously uploaded avatar can be replaced or removed.
 */

type Props = {
  value: string;
  onChange: (url: string) => void;
  error?: string;
};

const MAX_BYTES = 4 * 1024 * 1024; // keep in sync with src/lib/storage.ts

export default function AvatarDropzone({ value, onChange, error }: Props) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState("");

  const upload = useCallback(
    async (file: File) => {
      setLocalError("");
      if (!file.type.startsWith("image/")) {
        setLocalError(t("wizard.profile.avatar.errorType"));
        return;
      }
      if (file.size > MAX_BYTES) {
        setLocalError(t("wizard.profile.avatar.errorSize"));
        return;
      }
      setUploading(true);
      try {
        const body = new FormData();
        body.append("image", file);
        const res = await fetch("/api/upload", { method: "POST", body });
        const json = await res.json();
        if (!res.ok || !json.ok) throw new Error(json.error ?? "SAVE_FAILED");
        onChange(json.url);
      } catch (e) {
        const code = e instanceof Error && !e.message.startsWith("Unexpected") ? e.message : "SAVE_FAILED";
        setLocalError(code === "UNSUPPORTED_TYPE" ? t("wizard.profile.avatar.errorType") : code === "TOO_LARGE" ? t("wizard.profile.avatar.errorSize") : t("wizard.profile.avatar.errorUpload"));
      } finally {
        setUploading(false);
      }
    },
    [onChange, t],
  );

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void upload(file);
  }

  function onBrowse(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void upload(file);
    event.target.value = ""; // allow re-selecting the same file
  }

  const shownError = error || localError;

  return (
    <div className="avatar-upload">
      <span className="field-label">{t("wizard.profile.avatar.label")}</span>
      {value ? (
        <div className="avatar-upload-preview" role="group" aria-label={t("wizard.profile.avatar.label")}>
          {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded local path; next/image worker has no benefit here */}
          <img src={value} alt="" className="avatar-upload-thumb" />
          <div className="avatar-upload-preview-actions">
            <button type="button" className="button button-secondary" onClick={() => inputRef.current?.click()} disabled={uploading}>
              <Icon name="image" size={13} />
              {t("wizard.profile.avatar.replace")}
            </button>
            <button type="button" className="button button-secondary" onClick={() => { setLocalError(""); onChange(""); }} disabled={uploading}>
              {t("wizard.profile.avatar.remove")}
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-disabled={uploading}
          aria-label={t("wizard.profile.avatar.label")}
          className={`avatar-dropzone ${dragging ? "dragging" : ""} ${uploading ? "uploading" : ""} ${shownError ? "invalid" : ""}`}
          onClick={() => !uploading && inputRef.current?.click()}
          onKeyDown={(e) => { if (!uploading && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); inputRef.current?.click(); } }}
          onDragOver={(e) => { e.preventDefault(); if (!uploading) setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <Icon name="image" size={22} />
          <strong>{uploading ? t("wizard.profile.avatar.uploading") : t("wizard.profile.avatar.dropTitle")}</strong>
          <span>{t("wizard.profile.avatar.dropHint")}</span>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={onBrowse} />
      {shownError && <p className="field-error" role="alert">{shownError}</p>}
    </div>
  );
}
