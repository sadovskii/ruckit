import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MAX_LENGTH_RESTRICTION } from 'src/app/settings/layout-content/black-list/black-list.models';
import { RuckitFilteredOption } from './ruckit-option-list.models';

@Component({
  selector: 'ruckit-option-list',
  templateUrl: './ruckit-option-list.component.html',
  styleUrl: './ruckit-option-list.component.scss'
})
export class RuckitOptionListComponent implements OnInit, OnDestroy {
  @Input({ required: true })
  set optionList(value: string[]) {
    this._optionList = value;
    this._resetFilteredOptionList();

      if (this.optionList.length === 0) {
        this.searchFormControl.disable();
      }
      else {
        this.searchFormControl.enable();
      }
  }
  get optionList(): string[] {
    return this._optionList;
  }

  @Input({ required: true })
  public placeholder: string;

  @Input()
  public disabled: boolean;

  @Input()
  public maxLengthRestriction = 200;

  @Input()
  public height: string = '13.1rem';

  @Output()
  public addItem = new EventEmitter<string>;

  @Output()
  public removeItem = new EventEmitter<number>;

  protected searchFormControl = new FormControl<string>('', [Validators.required, Validators.maxLength(MAX_LENGTH_RESTRICTION)]);
  protected filteredOptionList: RuckitFilteredOption[];
  protected invalidAfterClick = false;

  private _subscriptions = new Subscription();
  private _optionList: string[] = [];

  constructor(private _cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.filteredOptionList = this.mapToFilteredOptionList(this.optionList);

    this._initSearchChangesHandler();
  }

  trackOptionList(index: any, item: RuckitFilteredOption) {
    return item.id;
  }

  remove(index: number) {
    if (this.filteredOptionList.length === 1 && this.searchFormControl.value) {
      this.searchFormControl.setValue('');
      this.searchFormControl.reset();
    }

    this.removeItem.emit(index);
  }

  protected addItemClick() {
    this.invalidAfterClick = true;
    if (this.searchFormControl.valid) {
      this.invalidAfterClick = false;
      this.addItem.emit(this.searchFormControl.value!);
      this.searchFormControl.setValue('');
      this.searchFormControl.reset();
    }
  }

  private _initSearchChangesHandler() {
    const sub = this.searchFormControl.valueChanges.subscribe(search => {
      if (search === null) {
        return;
      }

      if (search.length == 0) {
        this.filteredOptionList = this.mapToFilteredOptionList(this.optionList);
        return;
      }
      
      let searchLowerCase = search?.toLowerCase();

      let result = this.optionList.filter(t => t?.toLowerCase().includes(searchLowerCase));
      this.filteredOptionList = this.mapToFilteredOptionList(result);
    })

    this._subscriptions.add(sub);
  }

  private mapToFilteredOptionList(optionList: string[]): RuckitFilteredOption[] {
    return optionList.map(option => {
      return {
        option: option,
        id: this.optionList.indexOf(option)
      } as RuckitFilteredOption;
    });
  }

  private _resetFilteredOptionList() {
    let searchLowerCase = this.searchFormControl.value?.toLowerCase();

    let optionList = [];

    // If search is not empty, filter the option list based on the search input
    // Otherwise, use the full option list
    if (searchLowerCase) {
      optionList = this.optionList.filter(t => t?.toLowerCase().includes(searchLowerCase));
    }
    else {
      optionList = this.optionList;
    }

    this.filteredOptionList = this.mapToFilteredOptionList(optionList);
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }
}
