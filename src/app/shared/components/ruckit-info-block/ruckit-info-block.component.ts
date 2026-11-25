import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

// A framed note with an icon, a bold header and up to two grey lines of explanation.
@Component({
  selector: 'ruckit-info-block',
  templateUrl: './ruckit-info-block.component.html',
  styleUrls: ['./ruckit-info-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RuckitInfoBlockComponent {
  @Input({ required: true })
  public icon: string;

  @Input()
  public iconPack = 'ruckit-20';

  @Input({ required: true })
  public header: string;

  @Input()
  public lines: string[] = [];
}
