import { Component } from '@angular/core';

@Component({
  selector: 'app-hide-list',
  templateUrl: './hide-list.component.html',
  styleUrls: ['./hide-list.component.scss']
})
export class HideListComponent {
  // @HostBinding('class') protected readonly class = 'contents'; // Makes component host as if it was not there, can offer less css headaches. Assumes .contents{display:contents} css class exits
  // constructor() {}
}
