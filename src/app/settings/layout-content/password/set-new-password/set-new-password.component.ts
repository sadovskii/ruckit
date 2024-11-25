import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TagType } from 'src/app/shared/components/tag/tag.types';

@Component({
  selector: 'app-set-new-password',
  templateUrl: './set-new-password.component.html',
  styleUrls: ['./set-new-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetNewPasswordComponent {
  public TagType = TagType;
}
