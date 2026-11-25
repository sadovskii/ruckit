import { RuckitInfoBlockComponent } from './ruckit-info-block.component';

describe('RuckitInfoBlockComponent', () => {
  let component: RuckitInfoBlockComponent;

  beforeEach(() => {
    component = new RuckitInfoBlockComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('has no explanation lines and the 20 px icon pack by default', () => {
    expect(component.lines).toEqual([]);
    expect(component.iconPack).toBe('ruckit-20');
  });
});
