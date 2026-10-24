import { NbThemeService } from '@nebular/theme';
import { AppComponent } from './app.component';
import { ChromeService } from './shared/services/chrome/chrome.service';
import { GlobalService } from './shared/services/global/global.service';
import { IconRegisterService } from './shared/services/nbIcon-library-register.service';

describe('AppComponent', () => {
  let app: AppComponent;

  beforeEach(() => {
    app = new AppComponent(
      {} as ChromeService,
      {} as IconRegisterService,
      {} as GlobalService,
      {} as NbThemeService
    );
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it(`should have as title 'df-youtube-angular'`, () => {
    expect(app.title).toEqual('df-youtube-angular');
  });
});
