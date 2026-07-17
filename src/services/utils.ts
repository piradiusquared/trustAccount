import { ChangeEvent, useState } from "react";

/* -----------------------------------------------------------------------------
Functions used for pre-processing the form data. 
*/

// Shared function for converting bool to int for sqlite
export function mapLeaseFromDb(raw: any): any {
  return {
    ...raw,
    petsAllowed: raw.petsAllowed === undefined ? undefined : raw.petsAllowed === 1,
  };
}

export function booleanToSql(val?: boolean): number | undefined {
  if (val === undefined) return undefined;
  return val ? 1 : 0;
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
export function useForm<T>(initial: T) {
  const [form, setForm] = useState<T>(initial);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const { name, value } = target;

    setForm((current) => ({
        ...current,
        [name]: value,
    }));
  }

  return { form, setForm, handleChange };
}