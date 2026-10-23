import { NbDialogRef } from '@nebular/theme';
import { BlackListManageRestrictionsComponent } from './black-list-manage-restrictions.component';

describe('BlackListManageRestrictionsComponent', () => {
  let component: BlackListManageRestrictionsComponent;

  beforeEach(() => {
    component = new BlackListManageRestrictionsComponent({} as NbDialogRef<BlackListManageRestrictionsComponent>);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
