import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'humanizeRole',
  standalone: true
})
export class HumanizeRolePipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '';

    // 1. Remove ROLE_ prefix if present
    let result = value.replace(/^ROLE_/, '');

    // 2. Replace underscores with spaces
    result = result.replace(/_/g, ' ');

    // 3. Lowercase everything and then uppercase the first letter of each word
    return result
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
