import { Pipe, PipeTransform } from '@angular/core';
import { t } from './i18n';

/** Usage: `{{ 'message_key' | i18n }}` or `{{ 'message_key' | i18n: count }}` */
@Pipe({ name: 'i18n' })
export class I18nPipe implements PipeTransform {
  transform(key: string, substitutions?: string | number | (string | number)[]): string {
    return t(key, substitutions);
  }
}
