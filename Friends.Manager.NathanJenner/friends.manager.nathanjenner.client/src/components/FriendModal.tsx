import { useEffect, useRef } from 'react';
import { FriendForm } from './FriendForm';

export function FriendModal({ today, onSaved, onCancel }: {
    today: string;
    onSaved: () => void;
    onCancel: () => void;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog)
            return;

        const opener = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = 'hidden';
        dialog.querySelector<HTMLInputElement>('#friend-name')?.focus();

        return () => {
            dialog.close();
            document.body.style.overflow = previousOverflow;
            if (opener instanceof HTMLElement && opener.isConnected)
                opener.focus();
        };
    }, []);

    return <dialog ref={dialogRef} className="friend-modal" aria-labelledby="friend-form-heading"
        onCancel={event => {
            event.preventDefault();
            // Match the disabled Cancel button while a save is in progress.
            if (!dialogRef.current?.querySelector('fieldset:disabled'))
                onCancel();
        }}>
        <FriendForm friend={null} today={today} onDone={onSaved} onCancel={onCancel} />
    </dialog>;
}
