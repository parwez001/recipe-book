import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Ingredient } from 'src/app/shared/ingredient.modal';
import { ShoppingListService } from '../shopping-list.service';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
  @ViewChild('f') shoppingListForm: NgForm;
  subscription: Subscription;
  eidtMode = false;
  editedItemIndex: number;
  editedItem: Ingredient;


  constructor(private shoppingListService: ShoppingListService) { }

  ngOnInit(): void {
    this.subscription = this.shoppingListService.startedEditing.subscribe(
      (index: number) => {
        this.eidtMode = true;
        this.editedItemIndex = index;
        this.editedItem = this.shoppingListService.getIngredient(index);
        this.shoppingListForm.setValue({
          listName: this.editedItem.name,
          amount: this.editedItem.amount
        })
      }
    );
  }

  // onAddItem() {
  // const ingName = this.nameInputRef.nativeElement.value;
  // const ingAmount = this.amountInputRef.nativeElement.value;
  // const newIngredient = new Ingredient(ingName, ingAmount);
  // this.shoppingListService.addIngredient(newIngredient);
  // }



  onSubmit(form: NgForm) {
    console.log(form.value);
    const ingName = form.value.listName;
    const ingAmount = form.value.amount;
    const newIngredient = new Ingredient(ingName, ingAmount);
    if (this.eidtMode) {
      this.shoppingListService.updateIngredients(this.editedItemIndex, newIngredient);
    }
    else
      this.shoppingListService.addIngredient(newIngredient);
    form.reset()
    this.eidtMode = false;
  }

  onClear() {
    this.shoppingListForm.reset();
    this.eidtMode = false;
  }
  onDelete() {
    this.onClear();
    this.shoppingListService.deleteIngredient(this.editedItemIndex)
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
