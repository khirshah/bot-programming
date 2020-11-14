const playRound = (recipes, myBag, spellbook, tome) => {
    let action;
    //sort recipes by reward
    const ratedRecipes = rateRecipes(recipes, myBag.resources);
    //possible sort orders are: rating and price at the moment
    const sortedRecipes = sortRecipesBy(ratedRecipes, 'rating');
    //console.error('tome: ', tome, 'spellbook: ',spellbook);
    //console.error(sortedRecipes);
    //check is any of them can be brewed
    const potionToBrew = canAffordBrew(sortedRecipes[0], myBag.resources);
    console.error(potionToBrew);
    if (potionToBrew === 'NONE') {
        //none of them are affordable so let's pick the one with the highest reward
        const chosenRecipe = sortedRecipes[0];
        //select a spell to cast
        const spellToCast = useMagic(spellbook, myBag.resources, chosenRecipe);
        if (spellToCast === 'NONE') {
            action = 'REST';
        } else {
            action = `CAST ${spellToCast}`
        }
    } else {
        action = `BREW ${potionToBrew}`
    }
    console.error(action);
    return action;
}

//---------------------- spells ----------------------------------------
const canCast = (spell) => {
    if (spell.castable) {
        return spell.id;
    } else {
        return 'NONE';
    }
}

const conjureResource = (i, myResources, spellbook) => {
    if (i === 0) {
        //its a blue ingredient
        //check if +2 blue spell is available
        const spell = spellbook[0]
        return canCast(spell);
    } else {
        //it's a higher level ingredient
        if (myResources[i - 1] > 0) {
            //we have the resource to conjure it from
            //try casting the appropriate spell
            const spell = spellbook[i]
            return canCast(spell);
        } else {
            //we don't have the resource to conjure it from
            //try with lower level ingredient
            return conjureResource(i-1, myResources, spellbook);
        }
    }
}

const useMagic = (spellbook, myResources, recipe) => {
    for (i = 0; i < recipe.ingredients.length; ++i) {
        //compare resource and ingredient requirement
        if (myResources[i] < Math.abs(recipe.ingredients[i])) {
            //don't have the required amount
            return conjureResource(i, myResources, spellbook);
        }
    }
    return 'NONE';
}

//---------------------- recipes ----------------------------------------
const rateRecipes = (recipeList, resourceList) => {
    const recipes = recipeList;
    const ratedRecipes = recipes.map(recipe => {
        const handlingTime = calculateHandlingTime(recipe.ingredients, resourceList);
        const rating = recipe.price/handlingTime;
        updatedRecipe = {
            ...recipe,
            handlingTime,
            rating
        };
        return updatedRecipe;
    })
    return ratedRecipes;
}

const calculateHandlingTime = (ingredientList, resourceList) => {
    //the resource's place in the array defines the level of the item
    const individualTimes = ingredientList.map((item, level) => {
        const requriedAmount = Math.abs(item);
        const availableamount = resourceList[level];
        const amountNeeded = cantBeNegative(requriedAmount - availableamount);
        if (level === 0) {
            //blue runes
            //assumes: +2 blue spell is available, max 4 blue runes are required (when amount > 2)
            return amountNeeded <= 2 ? 1 : 3;
        } else {
            //higher level runes
            //the number of items times their levels (with one level at a time transformation)
            //+1 for the rest action
            return Math.abs(amountNeeded)*level+1;
        }
    });
    const handlingTime = sum(individualTimes);
    return handlingTime;
}


const sortRecipesBy = (recipeList, order) => {
    switch (order) {
        case 'rating':
            return recipeList.sort((a, b) => b.rating - a.rating);

        case 'price':
            return recipeList.sort((a, b) => b.price - a.price);
    
        default:
            return recipeList;
    }
}

const canAffordBrew = (recipe, resourceList) => {
    const ingredientList = recipe.ingredients;
    let haveAllIngredients = true;
    //loop through types of ingredients
    for (i in ingredientList) {
        //compare bag content and requirement
        if (resourceList[i] < Math.abs(ingredientList[i])) {
            haveAllIngredients = false;
        }
    }
    //return with recipe id if we have everything
    if (haveAllIngredients) {
        return recipe.id;
    } else {
        return 'NONE';
    }
};

//---------------------- helpers ----------------------------------------
const sum = (array) => {
    return array.reduce(function (a, b) {
        return a + b;
    }, 0);
};

const absSum = (array) => {
    return array.reduce(function (a, b) {
        return Math.abs(a) + Math.abs(b);
    }, 0);
};

const cantBeNegative = (number) => {
    return number < 0 ? 0 : number;
}