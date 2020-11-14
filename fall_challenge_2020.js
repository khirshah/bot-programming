const playRound = (recipes, myBag, spells) => {
    let action;
    //sort recipes by reward
    const sortedRecipes = sortRecipes(recipes);
    //check is any of them can be brewed
    const bestAffordableRecipe = canAffordBrew(sortedRecipes, myBag.resources);
    if (bestAffordableRecipe === 'NONE') {
        //none of them are affordable so let's pick the one with the highest reward
        const chosenRecipe = sortedRecipes[0];
        //select a spell to cast
        const spellToCast = useMagic(spells, myBag.resources, chosenRecipe);
        if (spellToCast === 'NONE') {
            action = 'REST';
        } else {
            action = `CAST ${spellToCast}`
        }
    } else {
        action = `BREW ${bestAffordableRecipe}`
    }
    console.error(action)
    return action;
}

//---------------------- cast ----------------------------------------
const canCast = (spell) => {
    if (spell.castable) {
        return spell.id;
    } else {
        return 'NONE';
    }
}

const conjureResource = (i, myResources, spells) => {
    if (i === 0) {
        //its a blue ingredient
        //check if +2 blue spell is available
        const spell = spells[0]
        return canCast(spell);
    } else {
        //it's a higher level ingredient
        console.error(i  -1, myResources);
        if (myResources[i - 1] > 0) {
            //we have the resource to conjure it from
            //try casting the appropriate spell
            const spell = spells[i]
            return canCast(spell);
        } else {
            //we don't have the resource to conjure it from
            //try with lower level ingredient
            return conjureResource(i-1, myResources, spells);
        }
    }
}

const useMagic = (spells, myResources, recipe) => {
    for (i = 0; i < recipe.ingredients.length; ++i) {
        //compare resource and ingredient requirement
        if (myResources[i] < Math.abs(recipe.ingredients[i])) {
            //don't have the required amount
            return conjureResource(i, myResources, spells);
        }
    }
    return 'NONE';
}

//---------------------- Brew ----------------------------------------
const sortRecipes = (recipeList) => {
    const sortedByPrice = recipeList.sort((a, b) => b.price - a.price);
    return sortedByPrice;
}

const canAffordBrew = (recipes, myIngredients) => {
    for (recipe of recipes) {
        let haveAllIngredients = true;
        //loop through types of ingredients
        for (i in recipe.ingredients) {
            //compare bag content and requirement
            if (myIngredients[i] < Math.abs(recipe.ingredients[i])) {
                haveAllIngredients = false;
            }
        }
        //return with recipe id if we have everything
        if (haveAllIngredients) {
            return recipe.id;
        }
    }
    return 'NONE';
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