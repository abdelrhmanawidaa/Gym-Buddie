import { Component, type ReactNode } from 'react';
import { useT } from '../lib/i18n';
import { Card, Button } from './ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render/runtime errors anywhere below it so one broken screen
 * doesn't take down the whole app with a blank white page. All app data
 * lives in IndexedDB, so a reload always recovers cleanly.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: { componentStack?: string | null }) {
    // eslint-disable-next-line no-console
    console.error('Unhandled error in app:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ onReset }: { onReset: () => void }) {
  const { t } = useT();
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <Card className="w-full max-w-sm">
        <p className="text-3xl">⚠️</p>
        <h1 className="mt-3 text-lg font-semibold text-white">{t('error.title')}</h1>
        <p className="mt-1.5 text-sm text-slate-400">{t('error.subtitle')}</p>
        <div className="mt-4 flex flex-col gap-2">
          <Button
            onClick={() => {
              onReset();
              window.location.hash = '#/';
              window.location.reload();
            }}
          >
            {t('error.reload')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              window.location.hash = '#/';
              onReset();
            }}
          >
            {t('error.goHome')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
