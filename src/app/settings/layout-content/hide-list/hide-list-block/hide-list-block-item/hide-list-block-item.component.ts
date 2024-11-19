import { Component } from '@angular/core';

@Component({
  selector: 'app-hide-list-block-item',
  templateUrl: './hide-list-block-item.component.html',
  styleUrls: ['./hide-list-block-item.component.scss']
})
export class HideListBlockItemComponent {
  // @HostBinding('class') protected readonly class = 'contents'; // Makes component host as if it was not there, can offer less css headaches. Assumes .contents{display:contents} css class exits
  // constructor() {}
}
