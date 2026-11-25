import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

// A small grey text button centred under a main button ("Forgot password?", "Cancel reset").
// Listen to (click) on the host element.
@Component({
  selector: 'ruckit-link-button',
  templateUrl: './ruckit-link-button.component.html',
  styleUrls: ['./ruckit-link-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RuckitLinkButtonComponent {
  @Input()
  public disabled = false;
}
