import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-black-list-simple-item',
  templateUrl: './black-list-simple-item.component.html',
  styleUrl: './black-list-simple-item.component.scss'
})
export class BlackListSimpleItemComponent implements OnInit {
  @Input({ required: true })
  public header: string;

  @Input({ required: true })
  public description: string;

  @Input({ required: true })
  public isRestricted: boolean;

  @Input({ required: true })
  public placeholder: string;

  @Input({ required: true })
  public hidenItems: string;

  @Input({ required: true })
  public hidenCountItems: number;

  @Input()
  public checked: boolean = true;

  public disabled: boolean = !this.checked;

  public toggleControl = new FormControl(this.checked);

  constructor(private _cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.toggleControl.valueChanges.subscribe(value => {
      this.disabled = !value!;
      this.checked = value!;
      console.log('toggle value = ', value);
    })
  }
}
