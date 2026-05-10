import { Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Pipe({ name: 'translate', pure: true, standalone: true })
export class TranslatePipe implements PipeTransform {
  constructor(private langService: LanguageService) {}

  // _lang is only used as a change-detection trigger — when lang$ | async emits,
  // Angular sees a new argument and re-evaluates the pure pipe.
  transform(key: string, _lang?: string | null): string {
    return this.langService.translate(key);
  }
}
