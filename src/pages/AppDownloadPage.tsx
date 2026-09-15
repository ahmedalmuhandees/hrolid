import { useMemo } from 'react';

type Platform = 'ios' | 'android' | 'other';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'other';
}

export default function AppDownloadPage() {
  const platform = useMemo(detectPlatform, []);

  return (
    <div className="download-wrap">
      <div className="download-card">
        <img
          className="download-logo"
          src="/solid-links-logo.png"
          alt="شركة الروابط الصلبة"
        />
        <p className="download-kicker">شركة الروابط الصلبة</p>
        <h1>تطبيق موجود</h1>
        <p className="muted download-lead">
          حمّل تطبيق الحضور حسب جهازك ثم ثبّته للمتابعة في تسجيل الدخول والخروج.
        </p>

        <div className="download-grid">
          <a
            className={`download-btn ios${platform === 'ios' ? ' recommended' : ''}`}
            href="/downloads/mawjood.mobileconfig"
            {...(platform === 'ios' ? {} : { download: 'mawjood.mobileconfig' })}
          >
            <AppleIcon />
            <span>
              <strong>آيفون</strong>
              <small>ملف إعدادات iOS</small>
            </span>
          </a>

          <a
            className={`download-btn android${platform === 'android' ? ' recommended' : ''}`}
            href="/downloads/mawjood.apk"
            download="موجود.apk"
          >
            <AndroidIcon />
            <span>
              <strong>أندرويد</strong>
              <small>ملف APK</small>
            </span>
          </a>
        </div>

        {platform === 'ios' && (
          <ol className="download-steps">
            <li>اضغط «آيفون» للسماح بتنزيل الملف الشخصي.</li>
            <li>افتح الإعدادات ثم «تم تنزيل الملف الشخصي».</li>
            <li>اضغط تثبيت وأدخل رمز الجهاز إن طُلب.</li>
          </ol>
        )}

        {platform === 'android' && (
          <ol className="download-steps">
            <li>اضغط «أندرويد» لتحميل ملف التطبيق.</li>
            <li>افتح الملف من الإشعارات أو مجلد التنزيلات.</li>
            <li>اسمح بالتثبيت من هذا المصدر إذا ظهرت رسالة تحذير.</li>
          </ol>
        )}

        {platform === 'other' && (
          <p className="hint">
            على الآيفون استخدم ملف الإعدادات. على الأندرويد ثبّت ملف APK مباشرة.
          </p>
        )}
      </div>
    </div>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.37 12.64c-.03-2.64 2.16-3.91 2.26-3.97-1.24-1.8-3.15-2.05-3.82-2.07-1.61-.17-3.17.96-3.99.96-.84 0-2.11-.94-3.48-.91-1.79.03-3.45 1.05-4.37 2.66-1.88 3.25-.48 8.05 1.33 10.69.9 1.29 1.96 2.74 3.35 2.69 1.35-.05 1.86-.87 3.49-.87 1.61 0 2.08.87 3.49.84 1.45-.02 2.36-1.3 3.24-2.6 1.03-1.49 1.45-2.94 1.47-3.01-.03-.01-2.8-1.07-2.83-4.41Zm-2.65-7.8c.73-.9 1.23-2.14 1.09-3.39-1.06.04-2.36.72-3.12 1.61-.68.78-1.28 2.05-1.12 3.25 1.18.09 2.4-.6 3.15-1.47Z"
      />
    </svg>
  );
}

function AndroidIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.6 9.48 19.1 6.9a.5.5 0 0 0-.2-.68.5.5 0 0 0-.68.2l-1.55 2.68A8.2 8.2 0 0 0 12 8.2a8.2 8.2 0 0 0-4.67.9L5.78 6.42a.5.5 0 1 0-.87.5l1.5 2.58A7.3 7.3 0 0 0 4.5 13.2v.3h15v-.3a7.3 7.3 0 0 0-1.9-4.02ZM8.4 12.15a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Zm7.2 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM6 14.5h12v4.2a2.3 2.3 0 0 1-2.3 2.3h-.4v2.1a.9.9 0 1 1-1.8 0v-2.1H10.5v2.1a.9.9 0 1 1-1.8 0v-2.1h-.4A2.3 2.3 0 0 1 6 18.7v-4.2Z"
      />
    </svg>
  );
}
