import { useNavigate } from 'react-router-dom';
import { useT } from '../lib/i18n';
import MachineScanner from '../components/MachineScanner';
import { PageHeader } from '../components/ui';

export default function Scanner() {
  const navigate = useNavigate();
  const { t } = useT();

  return (
    <div className="pb-4">
      <PageHeader
        title={t('scanner.title')}
        subtitle={t('scanner.subtitle')}
        action={
          <button onClick={() => navigate(-1)} className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300">
            {t('common.close')}
          </button>
        }
      />
      <div className="px-4">
        <MachineScanner />
      </div>
    </div>
  );
}
