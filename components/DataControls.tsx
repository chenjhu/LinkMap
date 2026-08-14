import React, { useRef, useState } from 'react';
import { Cloud, CloudOff, Download, LogIn, LogOut, Upload, X } from 'lucide-react';

interface DataControlsProps {
  cloudConfigured: boolean;
  email: string | null;
  migrationNeeded: boolean;
  syncMessage: string;
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
  onMigrate: () => Promise<void>;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
  onSignOut: () => Promise<void>;
}

export const DataControls: React.FC<DataControlsProps> = ({
  cloudConfigured,
  email,
  migrationNeeded,
  syncMessage,
  onExport,
  onImport,
  onMigrate,
  onSignIn,
  onSignUp,
  onSignOut,
}) => {
  const [open, setOpen] = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const run = async (action: () => Promise<void>, successMessage?: string) => {
    setBusy(true);
    setMessage('');
    try {
      await action();
      if (successMessage) setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '操作失败，请稍后重试');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={email ? `已登录：${email}` : '数据备份与云端同步'}
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/5 bg-white/84 text-[#70757f] shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition hover:text-[#1f2329]"
      >
        {cloudConfigured ? <Cloud className="h-4 w-4" /> : <CloudOff className="h-4 w-4" />}
        {email ? <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" /> : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#1f2329]/18 p-5 backdrop-blur-sm">
          <div className="w-full max-w-[440px] rounded-[30px] border border-white/75 bg-white/95 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#1f2329]">数据与账户</h2>
                <p className="mt-1 text-sm leading-6 text-[#70757f]">本地备份始终可用；登录后可跨设备同步。</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 text-[#8a9099] hover:bg-black/5">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={onExport} className="flex items-center justify-center gap-2 rounded-[18px] border border-black/5 bg-[#f5f6f8] px-4 py-3 text-sm font-semibold text-[#2b3037]">
                <Download className="h-4 w-4" /> 导出备份
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 rounded-[18px] border border-black/5 bg-[#f5f6f8] px-4 py-3 text-sm font-semibold text-[#2b3037]">
                <Upload className="h-4 w-4" /> 导入并合并
              </button>
              <input
                ref={fileInputRef}
                className="hidden"
                type="file"
                accept="application/json,.json"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void run(() => onImport(file), '联系人已导入并合并');
                  event.target.value = '';
                }}
              />
            </div>

            <div className="my-5 h-px bg-black/5" />

            {!cloudConfigured ? (
              <div className="rounded-[20px] bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                云端服务尚未连接。当前仍使用本机存储，导入和导出功能不受影响。
              </div>
            ) : email ? (
              <div className="space-y-3">
                <div className="rounded-[20px] bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  已登录：{email}
                  {syncMessage ? <div className="mt-1 text-xs opacity-75">{syncMessage}</div> : null}
                </div>
                {migrationNeeded ? (
                  <button
                    disabled={busy}
                    onClick={() => void run(onMigrate, '本机联系人已安全同步到云端')}
                    className="w-full rounded-[18px] bg-[#5b8def] py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    将现有本机联系人导入云端
                  </button>
                ) : null}
                <button disabled={busy} onClick={() => void run(onSignOut)} className="flex w-full items-center justify-center gap-2 py-2 text-sm font-semibold text-[#70757f]">
                  <LogOut className="h-4 w-4" /> 退出登录
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  value={formEmail}
                  onChange={(event) => setFormEmail(event.target.value)}
                  placeholder="邮箱"
                  className="w-full rounded-[18px] border border-black/5 bg-[#f5f6f8] px-4 py-3 text-sm outline-none focus:border-[#8cabf2] focus:ring-4 focus:ring-[#8cabf2]/15"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="密码（至少 6 位）"
                  className="w-full rounded-[18px] border border-black/5 bg-[#f5f6f8] px-4 py-3 text-sm outline-none focus:border-[#8cabf2] focus:ring-4 focus:ring-[#8cabf2]/15"
                />
                <div className="grid grid-cols-2 gap-3">
                  <button
                    disabled={busy || !formEmail || password.length < 6}
                    onClick={() => void run(() => onSignIn(formEmail, password))}
                    className="flex items-center justify-center gap-2 rounded-[18px] bg-[#1f2329] py-3 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    <LogIn className="h-4 w-4" /> 登录
                  </button>
                  <button
                    disabled={busy || !formEmail || password.length < 6}
                    onClick={() => void run(() => onSignUp(formEmail, password), '注册成功；如收到验证邮件，请先完成验证')}
                    className="rounded-[18px] border border-black/8 py-3 text-sm font-semibold text-[#2b3037] disabled:opacity-40"
                  >
                    注册
                  </button>
                </div>
              </div>
            )}

            {message ? <p className="mt-4 text-center text-sm text-[#70757f]">{message}</p> : null}
          </div>
        </div>
      ) : null}
    </>
  );
};
