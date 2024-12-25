/**
 * @class SceneNode
 * @desc A SceneNode is a node in the scene graph.
 * @property {MeshDrawer} meshDrawer - The MeshDrawer object to draw
 * @property {TRS} trs - The TRS object to transform the MeshDrawer
 * @property {SceneNode} parent - The parent node
 * @property {Array} children - The children nodes
 */

class SceneNode {
    constructor(meshDrawer, trs, parent = null) {
        this.meshDrawer = meshDrawer;
        this.trs = trs;
        this.parent = parent;
        this.children = [];

        if (parent) {
            this.parent.__addChild(this);
        }
    }

    __addChild(node) {
        this.children.push(node);
    }

    draw(mvp, modelView, normalMatrix, modelMatrix) {
        /**
         * @Task1: Implement the draw function for the SceneNode class.
         */
    
        // Get the transformation matrix for the current node using its TRS object
        const localTransform = this.trs.getTransformationMatrix();
    
        // Update the transformation matrices using MatrixMult (parent-to-child propagation)
        const updatedModelMatrix = MatrixMult(modelMatrix, localTransform); 
        const updatedModelView = MatrixMult(modelView, localTransform);    
        const updatedNormalMatrix = MatrixMult(normalMatrix, MatrixMult(localTransform, getIdentityMatrix())); // Normals
        const updatedMvp = MatrixMult(mvp, localTransform);                // Update the MVP matrix
    
        // Draw the current node's mesh if it exists
        if (this.meshDrawer) {
            this.meshDrawer.draw(updatedMvp, updatedModelView, updatedNormalMatrix, updatedModelMatrix);
        }
    
        // Recursively draw all child nodes
        for (const child of this.children) {
            child.draw(updatedMvp, updatedModelView, updatedNormalMatrix, updatedModelMatrix);
        }
    }
    
    

    

}