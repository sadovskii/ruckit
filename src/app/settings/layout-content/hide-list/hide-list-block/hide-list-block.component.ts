import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hide-list-block',
  templateUrl: './hide-list-block.component.html',
  styleUrls: ['./hide-list-block.component.scss']
})
export class HideListBlockComponent {

  @Input({ required: true })
  public items: any[];

  @Input({ required: true })
  public header: string;
}
