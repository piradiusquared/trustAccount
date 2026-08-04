import { ChangeEvent, useState } from "react";

/* -----------------------------------------------------------------------------
Functions used for pre-processing the form data. 
*/

// Shared function for converting bool to int for sqlite
export function mapLeaseFromDb(raw: any): any {
    return {
        ...raw,
        petsAllowed: raw.petsAllowed === undefined ? undefined : raw.petsAllowed === 0,
    };
}


export function getLocalIsoString(): string {
    const date = new Date();
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);

    return localDate.toISOString().slice(0, -1);
}

/*
Combines detailed address components into a single address.
Overseas address is optional for now
*/
export function formatPostalAddress(form: any): string {
    if (form.country !== "Australia") {
        return `${form.overseasAddress}, ${form.country}`;
    }

    // For Australian addresses, build the string step-by-step
    const unit = form.unitNumber ? `Unit/Room ${form.unitNumber}, ` : '';
    const street = `${form.streetNumber} ${form.streetName}`.trim();
    const location = `${form.suburb} ${form.state} ${form.postcode}`.trim();

    // Combine them, filtering out any empty parts
    return [unit + street, location, form.country]
        .filter(part => part.trim() !== '')
        .join(', ');
}

/* -----------------------------------------------------------------------------
Shared form behaviour functions.
*/


// export function handleChange<T>(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>, setter: React.Dispatch<React.SetStateAction<T>>) {
//     const target = event.target as HTMLInputElement | HTMLSelectElement;
//     const { name, value } = target;

//     setter((current) => ({
//         ...current,
//         [name]: value,
//     }));
// }

/*
Hook used for creating and managing forms. 
*/
export function useForm<T extends object>(initial: T) {
    const [form, setForm] = useState<T>(initial);

    function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const target = event.target as HTMLInputElement | HTMLSelectElement;
        const { name, value } = target;

        // setForm((current) => ({
        //     ...current,
        //     [name]: value,
        // }));
        setForm((current) => {
            const nextState = {
                ...current,
                [name]: value,
            }
            if ('bondCents' in nextState && name === 'rentCents') {
                const rentValue = parseFloat(value);
                (nextState as any).bondCents = !isNaN(rentValue) && rentValue > 0 ? (rentValue * 4) : 0;
            }
            return nextState;
        })
    }
    return { form, setForm, handleChange };
}

export function useFormArray<T extends object>(initial: T, maxEntries: number) {
    const [ formArr, setFormArr ] = useState<T[]>([{ ...initial }]);

    function addEntry() {
        if (formArr.length < maxEntries) {
            setFormArr((prev) => [
                ...prev,
                { ...initial }
            ]);
        }
    };

    // Add in popup to confirm with user
    function removeEntry(removeIdx: number) {
        if (formArr.length > 1) {
            setFormArr((prev) => prev.filter((_, i) => i !== removeIdx));
        }
    };

    function handleEntryChange<K extends keyof T>(idx: number, field: keyof typeof initial, value: T[K]) {
        setFormArr((prev) => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], [field]: value};
            return updated
        })
    };

    return { formArr, setFormArr, addEntry, removeEntry, handleEntryChange };
}

// Imports for below
import { useEffect, useCallback } from "react";
import { EntityId, RecordStatus } from "../lib/datatypes";

export interface StatusRec {
    id: EntityId;
    status: RecordStatus;
}

export interface IsStatusService<T> {
    getActive(): Promise<T[]>;
    getInactive(): Promise<T[]>;
    updateStatus(id: string, status: any): Promise<void>;
}

export function useData<T extends StatusRec>(service: IsStatusService<T>) {

    const [active, setActiveItems] = useState<T[]>([]);
    const [inactive, setInactiveItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Use useCallback so we can safely include this in useEffect dependencies
    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [active, inactive] = await Promise.all([
            service.getActive(),
            service.getInactive(),
            ]);
            setActiveItems(active);
            setInactiveItems(inactive);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [service]);

    // Toggle status dynamically
    const toggleStatus = async (id: string, currentStatus: string, inactiveValue: string = 'inactive') => {
        const nextStatus = currentStatus === 'active' ? inactiveValue : 'active';
        try {
            await service.updateStatus(id, nextStatus);
            await fetchAll(); // Auto-reload the lists on success
        } catch (err) {
            console.error('Failed to toggle status:', err);
            throw err;
        }
    };

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return { active, inactive, loading, error, refresh: fetchAll, toggleStatus };
}