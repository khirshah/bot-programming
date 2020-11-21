/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

const playRound = (recipes, myBag, spellbook, tome) => {
    let action;
    //sort recipes by reward
    const ratedRecipes = rateRecipes(recipes, myBag.resources);
    //possible sort orders are: rating and reward at the moment
    const sortedRecipes = sortRecipesBy(ratedRecipes, 'rating');
    const chosenRecipe = sortedRecipes[0];
    //check if selected recipe can be brewed
    const potionToBrew = canAffordBrew(chosenRecipe, myBag.resources);
    if (potionToBrew === 'NONE') {
        //select a spell to cast
        action = selectSpellToCastOrLearn(tome, spellbook, myBag.resources, chosenRecipe);
    } else {
        action = `BREW ${potionToBrew}`
    }
    return action;
}

//---------------------- spells ----------------------------------------
const selectSpellToCastOrLearn = (tome, spellbook, resources, recipe) => {
    //take current state of resources
    const currentHandlingTime = calculateHandlingTime(recipe.ingredients, resources);
    const bestSpellToLearn = selectBestSpellToLearn(tome, resources, recipe, currentHandlingTime);
    const bestSpellToCast = selectBestSpellToCast(spellbook, resources, recipe, currentHandlingTime);
    //shall we learn? or shall we cast?
    //if suggested spell doesn't remove stuff from your bag, learn it
    if(bestSpellToLearn != 'NONE' && spellOnlyAddsToBag(bestSpellToLearn)) {
        return `LEARN ${bestSpellToLearn.id}`;
    } else if (bestSpellToLearn != 'NONE' && bestSpellToCast != 'NONE') {
        switch (bestSpellToLearn.rating - bestSpellToCast.rating) {
            case 1:
                return `LEARN ${bestSpellToLearn.id}`;

            case 0:
                return `LEARN ${bestSpellToLearn.id}`;

            case -1:
                return `CAST ${bestSpellToCast.id}`;

            default:
                return `CAST ${bestSpellToCast.id}`;
        }
    } else if (bestSpellToCast != 'NONE') {
        return `CAST ${bestSpellToCast.id}`;
    } else if (bestSpellToLearn != 'NONE') {
        return `LEARN ${bestSpellToLearn.id}`;
    } else {
        return 'REST'
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


selectBestSpellToLearn = (tome, resources, recipe, currentHandlingTime) => {
    //go through all the spells in the spellbook and in the tome
    //rate them according to drop in handling time
    const ratedTomeSpells = tome.map(spell => {
        let ratedSpell;
        //if we can afford LEARNING the spell and if we can CAST it return rating of spell
        if (Math.abs(spell.tomeIndex) <= resources[0] && canAffordCast(spell.effect, resources)) {
            const rating = rateSpell(spell, recipe, resources);
            ratedSpell = {
                ...spell,
                rating,
                ableToLearn: true
            };
        } else {
            //otherwise return current handling time
            ratedSpell = {
                ...spell,
                currentHandlingTime,
                ableToLearn: false
            };
        }
        return ratedSpell;
    });
        //select the one that brings us closest to pur goal
    const possibleSpellsToLearn = ratedTomeSpells.filter(spell => {
        return spell.ableToLearn == true;
    });
    let bestSpellToLearn;
    if (possibleSpellsToLearn.length > 1) {
        bestSpellToLearn = possibleSpellsToLearn.sort((a, b) => a.rating - b.rating)[0];
    } else if (possibleSpellsToLearn.length === 0) {
        bestSpellToLearn = 'NONE';
    } else {
        bestSpellToLearn = possibleSpellsToLearn[0];
    }
    return bestSpellToLearn;
}

selectBestSpellToCast = (spellbook, resources, recipe, currentHandlingTime) => {
    const ratedOwnSpells = spellbook.map(spell => {
        let ratedSpell;
        //if we can afford CASTING the spell and spell is castable return rating of spell
        //also, casting doesn't overfill bag
        const isBagOverFilled = sum(castSpell(spell.effect,resources)) > 10;
        if (canAffordCast(spell.effect, resources) && spell.castable && !isBagOverFilled) {
            const rating = rateSpell(spell, recipe, resources);
            ratedSpell = {
                ...spell,
                rating,
                ableToCast: true
            };
        } else {
            //otherwise return current handling time
            ratedSpell = {
                ...spell,
                currentHandlingTime,
                ableToCast: false
            };
        }
        return ratedSpell;
    });


    const possibleSpellsToCast = ratedOwnSpells.filter(spell => {
        return spell.ableToCast == true;
    });
    let bestSpellToCast;
    if (possibleSpellsToCast.length > 1) {
        bestSpellToCast = possibleSpellsToCast.sort((a, b) => a.rating - b.rating)[0];
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
    resources.map((resource, i)=> {
        //if they don't go below 0 by casting the spell on it we are ok
       if (changes[i] + resource < 0) {
           canCast = false;
       };
    });;
    return canCast;
}

const castSpell = (changes, resources) => {
    //go through resources
    return resources.map((resource,i )=> {
       return changes[i] + resource;
    });;
}

const rateSpell = (spell, recipe, resources) => {
    //take current state of resources
    //cast spell on it
    const resourcesAfterCast = castSpell(spell.effect, resources);
    //get handling time for new bag content
    const handlingTimeAfterCast = calculateHandlingTime(recipe.ingredients, resourcesAfterCast);
    //return handling time after cast
    return handlingTimeAfterCast;
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

// game loop
while (true) {
    const actionCount = parseInt(readline()); // the number of spells and recipes in play
    const recipes = [];
    const spellbook = [];
    const tome = [];
    const myBag = {};
    for (let i = 0; i < actionCount; i++) {
        var inputs = readline().split(' ');
        const actionId = parseInt(inputs[0]); // the unique ID of this spell or recipe
        const actionType = inputs[1]; // in the first league: BREW; later: CAST, OPPONENT_CAST, LEARN, BREW
        const delta0 = parseInt(inputs[2]); // tier-0 ingredient change
        const delta1 = parseInt(inputs[3]); // tier-1 ingredient change
        const delta2 = parseInt(inputs[4]); // tier-2 ingredient change
        const delta3 = parseInt(inputs[5]); // tier-3 ingredient change
        const price = parseInt(inputs[6]); // the price in rupees if this is a potion
        const tomeIndex = parseInt(inputs[7]); // in the first two leagues: always 0; later: the index in the tome if this is a tome spell, equal to the read-ahead tax
        const taxCount = parseInt(inputs[8]); // in the first two leagues: always 0; later: the amount of taxed tier-0 ingredients you gain from learning this spell
        const castable = inputs[9] !== '0'; // in the first league: always 0; later: 1 if this is a castable player spell
        const repeatable = inputs[10] !== '0'; // for the first two leagues: always 0; later: 1 if this is a repeatable player spell
        switch (actionType) {
            case 'BREW':
                recipes.push({
                    id: actionId,
                    ingredients: [delta0, delta1, delta2, delta3],
                    price,
                });
                break;

            case 'CAST':
                spellbook.push({
                    id: actionId,
                    effect: [delta0, delta1, delta2, delta3],
                    castable,
                    repeatable
                });
                break;

            case 'LEARN':
                tome.push({
                    id: actionId,
                    effect: [delta0, delta1, delta2, delta3],
                    repeatable,
                    tomeIndex,
                    taxCount,
                });
                break;

            default:
                break;
        };

    }
    for (let i = 0; i < 2; i++) {
        var inputs = readline().split(' ');
        const inv0 = parseInt(inputs[0]); // tier-0 ingredients in inventory
        const inv1 = parseInt(inputs[1]);
        const inv2 = parseInt(inputs[2]);
        const inv3 = parseInt(inputs[3]);
        const score = parseInt(inputs[4]); // amount of rupees
        if (i == 0) {
            myBag.resources = [inv0, inv1, inv2, inv3];
            myBag.money = score;
        }
    }

    // Write an action using console.log()
    // To debug: console.error('Debug messages...');


    // in the first league: BREW <id> | WAIT; later: BREW <id> | CAST <id> [<times>] | LEARN <id> | REST | WAIT
    const action = playRound(recipes, myBag, spellbook, tome);

    console.log(action);
}
