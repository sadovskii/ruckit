import { Component, Input } from '@angular/core';
import { ViewVersions } from 'src/app/shared/types';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  @Input({ required: true })
  public header: string;

  protected ViewVersions = ViewVersions;

  @Input()
  public viewVersion: ViewVersions = ViewVersions.large;
}
