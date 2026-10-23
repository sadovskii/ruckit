import { DomSanitizer } from '@angular/platform-browser';
import { StartPageComponent } from './start-page.component';

describe('StartPageComponent', () => {
  let component: StartPageComponent;

  beforeEach(() => {
    component = new StartPageComponent({} as DomSanitizer);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
