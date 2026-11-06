import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { containsLetterDigitOrEmoji } from 'src/extension/black-list/common/black-list-item-rules';
import { MAX_LENGTH_RESTRICTION } from './black-list.models';

/**
 * Rejects input made only of spaces and symbols (" ", ".", ":", "..."). An empty input is left to Validators.required.
 */
export const blackListItemValidator: ValidatorFn = (control: AbstractControl<string | null>): ValidationErrors | null => {
    const value = control.value;

    if (!value) return null;

    return containsLetterDigitOrEmoji(value) ? null : { noLetterDigitOrEmoji: true };
};

/** Validators of every input that adds a keyword or phrase (card input, dialog form, adding from the dialog search). */
export const BLACK_LIST_ITEM_VALIDATORS: ValidatorFn[] = [
    Validators.required,
    Validators.maxLength(MAX_LENGTH_RESTRICTION),
    blackListItemValidator,
];
