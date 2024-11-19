import { Component } from '@angular/core';

@Component({
  selector: 'app-about-extension',
  templateUrl: './about-extension.component.html',
  styleUrls: ['./about-extension.component.scss']
})
export class AboutExtensionComponent {
  // @HostBinding('class') protected readonly class = 'contents'; // Makes component host as if it was not there, can offer less css headaches. Assumes .contents{display:contents} css class exits
  // constructor() {}
}
