import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DEMON_SVGS, QUOTES } from 'src/app/shared/constants';

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss']
})
export class StartPageComponent implements OnInit {

  public QUOTES = QUOTES;
  public DEAMON_SVGS = DEMON_SVGS;

  public demonSvgUrl: string;
  public isSvgLoaded: boolean = false;

  constructor(private _sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.demonSvgUrl = this.demonUrl();
  }

  demonUrl(): string {

    const values = Object.values(DEMON_SVGS);
    const randomNumber = this.getRandomIntInclusive(0, values.length - 1);
    const demonUrl = `../../../../${values[randomNumber]}`;

    return this._sanitizer.bypassSecurityTrustResourceUrl(demonUrl) as string;
  }

  getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; 
  }

  // Method to be called when the image's 'load' event fires
  onSvgLoad() {
    this.isSvgLoaded = true;
  }
}
