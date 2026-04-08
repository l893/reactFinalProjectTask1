import styles from './offline-banner.module.scss';

interface OfflineBannerProps {
  isOnline: boolean;
}

export function OfflineBanner({
  isOnline,
}: OfflineBannerProps): React.JSX.Element | null {
  if (isOnline) return null;

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <div className={styles.content}>
        <span>Offline mode</span>
        <span className={styles.muted}>
          Changes will sync when you are back online.
        </span>
      </div>
    </div>
  );
}
