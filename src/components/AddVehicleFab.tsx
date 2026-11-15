import { CarIcon } from './icons/VehicleSectionIcons';

interface Props {
    onClick: () => void;
}

export function AddVehicleFab({ onClick }: Props) {
    return (
        <button
            onClick={onClick}
            aria-label="Добавить автомобиль"
            title="Добавить автомобиль"
            className="fab-bottom fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-md3-full bg-primary text-primary-on shadow-md3-3 transition-transform duration-150 active:scale-95"
        >
            <span className="relative inline-flex">
                <CarIcon className="h-7 w-7" />
                <span
                    className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-surface text-label-sm font-bold leading-none text-primary"
                    aria-hidden="true"
                >
                    +
                </span>
            </span>
        </button>
    );
}
