import { TagComponent } from './tag.component';

describe('TagComponent', () => {
  let component: TagComponent;

  beforeEach(() => {
    component = new TagComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('has no icon unless one is given, and uses the 16 px icon pack', () => {
    expect(component.icon).toBeUndefined();
    expect(component.iconPack).toBe('ruckit-16');
  });
});
