#!/bin/bash
cd ${0%/*}

# Update main branch from current work branch

current_branch=$(git branch --show-current)
echo current $current_branch

exit

cd ..
quiet=--quiet

# deploy to github pages
#
# merge branch current in to main brnach
#

# ./moLib/bin/build.sh --src ./ --files src,README.md --prod $quiet
# find version string
VERSION=$(grep -e "my.version =" DrawPoints/a_sketch.js)

# comment current changes 
git add . 
git commit $quiet -m "$VERSION"
git push $quiet


# switch to main and merge from current
git checkout main $quiet
git merge $current_branch $quiet -m "$VERSION"
git push $quiet

# switch back to prior branch
git checkout $current_branch $quiet

echo
echo "build $VERSION"

