/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

const playRound = (recipes, myBag, spellbook, tome) => {
    let action;
    //sort recipes by reward
    const ratedRecipes = rateRecipes(recipes, myBag.resources, spellbook);
    //possible sort orders are: rating and reward at the moment
    const sortedRecipes = sortRecipesBy(ratedRecipes, 'rating');
    const chosenRecipe = sortedRecipes[0];
    //check if selected recipe can be brewed
    const IsPotionReady = canAffordBrew(chosenRecipe, myBag.resources);
    if (IsPotionReady) {
        action = `BREW ${chosenRecipe.id}`;
    } else {
        //select a spell to cast
        action = selectSpellToCastOrLearn(tome, spellbook, myBag.resources, chosenRecipe);
    }
    return action;
}

//---------------------- spells ----------------------------------------
const selectSpellToCastOrLearn = (tome, spellbook, resources, recipe) => {
    const bestSpellToLearn = selectBestSpellToLearn(tome, resources, recipe);
    const bestSpellToCast = selectBestSpellToCast(spellbook, resources, recipe);
    //shall we learn? or shall we cast?
    //if casting suggested spell doesn't remove stuff from your bag, learn it
    if (bestSpellToLearn != 'NONE' && spellOnlyAddsToBag(bestSpellToLearn)) {
        console.error('spell is cool')
        return `LEARN ${bestSpellToLearn.id}`;
    } else if (bestSpellToLearn != 'NONE' && bestSpellToCast != 'NONE') {
        console.error("learn or cast? : ",bestSpellToLearn.rating, " - ", bestSpellToCast.rating, " = ",bestSpellToLearn.rating - bestSpellToCast.rating)
        const ratingDiff = bestSpellToLearn.rating - bestSpellToCast.rating;
        switch (ratingDiff) {
            case ratingDiff > 0:
                return `LEARN ${bestSpellToLearn.id}`;

            case ratingDiff == 0:
                return `CAST ${bestSpellToCast.id}`;

            case ratingDiff < 0:
                return `CAST ${bestSpellToCast.id}`;

            default:
                return `CAST ${bestSpellToCast.id}`;
        }
    } else if (bestSpellToCast != 'NONE') {
        console.error('there is only spell to cast ',bestSpellToCast.rating )
        return `CAST ${bestSpellToCast.id}`;
    } else if (bestSpellToLearn != 'NONE') {
        console.error('there is only spell to learn ', bestSpellToLearn.rating)
        return `LEARN ${bestSpellToLearn.id}`;
    } else {
        return 'REST';
    }
}

const spellOnlyAddsToBag = (spell) => {
    let spellOnlyAddsItems = true;
    spell.effect.map(ingredient => {
        if (ingredient < 0) {
            spellOnlyAddsItems = false;
        }
    })
    return spellOnlyAddsItems;
}

selectBestSpellToLearn = (tome, resources, recipe) => {
    const currentHandlingTime = calculateHandlingTime(recipe, resources);
    //go through all the spells in the spellbook and in the tome
    //rate them according to drop in handling time
    const ratedTomeSpells = tome.map(spell => {
        let ratedSpell;
        //if we can afford LEARNING the spell and if we can CAST it return rating of spell
        const rating = rateSpell(spell, recipe, resources, currentHandlingTime);
        if (Math.abs(spell.tomeIndex) <= resources[0] && canAffordCast(spell.effect, resources) && rating >= 0) {
            ratedSpell = {
                ...spell,
                rating,
                ableToLearn: true
            };
        } else {
            //otherwise return current handling time
            ratedSpell = {
                ...spell,
                rating: 0,
                ableToLearn: false
            };
        }
        return ratedSpell;
    });
    //select the one that brings us closest to pur goal
    const possibleSpellsToLearn = ratedTomeSpells.filter(spell => {
        return (spell.ableToLearn && spell.rating >= 0) == true;
    });
    let bestSpellToLearn;
    if (possibleSpellsToLearn.length > 1) {
        bestSpellToLearn = possibleSpellsToLearn.sort((a, b) => b.rating - a.rating)[0];
    } else if (possibleSpellsToLearn.length === 0) {
        bestSpellToLearn = 'NONE';
    } else {
        bestSpellToLearn = possibleSpellsToLearn[0];
    }
    return bestSpellToLearn;
}

selectBestSpellToCast = (spellbook, resources, recipe) => {
    const currentHandlingTime = calculateHandlingTime(recipe, resources);
    const ratedOwnSpells = spellbook.map(spell => {
        let ratedSpell;
        //if we can afford CASTING the spell and spell is castable return rating of spell
        //also, casting doesn't overfill bag
        const isBagOverFilled = sum(castSpell(spell.effect, resources)) > 10;
        const rating = rateSpell(spell, recipe, resources, currentHandlingTime);
        if (canAffordCast(spell.effect, resources) && spell.castable && !isBagOverFilled && rating >= 0) {
            ratedSpell = {
                ...spell,
                rating,
                ableToCast: true
            };
        } else {
            //otherwise return current handling time
            ratedSpell = {
                ...spell,
                rating: 0,
                ableToCast: false
            };
        }
        return ratedSpell;
    });
    //get out the ones we don't have the resources for
    const possibleSpellsToCast = ratedOwnSpells.filter(spell => {
        return (spell.ableToCast && spell.rating >= 0) == true;
    });
    let bestSpellToCast;
    //if there are more than 1 left
    if (possibleSpellsToCast.length > 1) {
        //sort them by rating, highest first
        bestSpellToCast = possibleSpellsToCast.sort((a, b) => b.rating - a.rating)[0];
    } else if (possibleSpellsToCast.length === 0) {
        bestSpellToCast = 'NONE';
    } else {
        bestSpellToCast = possibleSpellsToCast[0];
    }
    return bestSpellToCast;
}

const canAffordCast = (changes, resources) => {
    let canCast = true;
    //go through resources
    resources.map((resource, i) => {
        //if they don't go below 0 by casting the spell on it we are ok
        if (changes[i] + resource < 0) {
            canCast = false;
        };
    });;
    return canCast;
}

const castSpell = (changes, resources) => {
    return resources.map((resource, i) => {
        return changes[i] + resource;
    });;
}

const rateSpell = (spell, recipe, resources, currentHandlingTime) => {
    //take current state of resources and cast the spell on it
    const resourcesAfterCast = castSpell(spell.effect, resources);
    //if it is a tome spell, calculate with the tax as well
    if (spell.taxCount) {
        resourcesAfterCast[0] = resourcesAfterCast[0] + spell.taxCount;
    }
    //get handling time for new bag content
    const handlingTimeAfterCast = calculateHandlingTime(recipe, resourcesAfterCast);
    //return the difference in handlingtime due to this spell
    const rating = currentHandlingTime - handlingTimeAfterCast;
    return rating;
}

//---------------------- recipes ----------------------------------------
const rateRecipes = (recipeList, resourceList, spellbook) => {
    const recipes = recipeList;
    const ratedRecipes = recipes.map(recipe => {
        const handlingTime = calculateHandlingTime(recipe, resourceList);
        const rating = recipe.price / handlingTime;
        updatedRecipe = {
            ...recipe,
            handlingTime,
            rating
        };
        return updatedRecipe;
    })
    return ratedRecipes;
}

const calculateHandlingTime = (recipe, resourceList, spellbook) => {
    const ingredientList = recipe.ingredients;
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
            return Math.abs(amountNeeded) * level;
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
    //go through resources
    resourceList.map((resource, i) => {
        //if they don't go below 0 by brewing the potion we are ok
        if (ingredientList[i] + resource < 0) {
            haveAllIngredients = false;
        };
    });
    return haveAllIngredients;
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