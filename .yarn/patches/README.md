# Dependency patches

This folder contains small patches necessary to fix build issues/bugs with unmaintained/rarely maintained packages.

## Creating new patches

These patches are created using [`yarn patch`](https://yarnpkg.com/features/patching) - for more information, check its documentation.

## Notes

- You may have to remove and re-create patches when updating a package - if you're not sure what to do or have any questions, feel free to [open a new issue](https://github.com/upryzing/clerotri/issues/new/choose) or reach out to us [here](https://rvlt.gg/rvmob).
- If a package has received a large amount of patches and isn't being maintained, it might be worth investigating alternatives/forking the package - if so, get in contact using the info above.
- If you're willing to do so and the package still appears to be maintained, it might also be worth submitting your patch as a PR to the package in question. This helps other users of the package avoid the same issue(s) and reduces our maintenance burden. However, unless the PR is merged and until a new version containing it is released, **do not remove the patch from this folder** and, if you're adding a new patch, **submit it as usual**.
