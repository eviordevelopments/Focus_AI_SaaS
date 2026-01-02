import { HealthForm } from './Health/HealthForm';
import { BurnoutGauge } from './Health/BurnoutGauge';

export function HealthView() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            <BurnoutGauge />
            <HealthForm />
        </div>
    );
}
