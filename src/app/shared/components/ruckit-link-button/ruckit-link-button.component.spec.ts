import { RuckitLinkButtonComponent } from './ruckit-link-button.component';

describe('RuckitLinkButtonComponent', () => {
  it('should create and be enabled by default', () => {
    const component = new RuckitLinkButtonComponent();

    expect(component).toBeTruthy();
    expect(component.disabled).toBeFalse();
  });
});
