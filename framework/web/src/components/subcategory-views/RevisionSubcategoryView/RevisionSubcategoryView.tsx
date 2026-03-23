import AddedFrameworkNode from "@/components/framework-nodes/revision-nodes/AddedFrameworkNode/AddedFrameworkNode";
import DeletedFrameworkNode from "@/components/framework-nodes/revision-nodes/DeletedFrameworkNode/DeletedFrameworkNode";
import UpdatedFrameworkNode from "@/components/framework-nodes/revision-nodes/UpdatedFrameworkNode/UpdatedFrameworkNode";
import { Subcategory } from "@/types/framework";
import SubcategoryContentView from "../SubcategoryContentView/SubcategoryContentView";

type AddProps = {
  op: "added";
  subcategory: Subcategory;
};

type DeleteProps = {
  op: "deleted";
  subcategory: Subcategory;
};

type UpdateProps = {
  op: "updated";
  before: Subcategory;
  after: Subcategory;
};

type RevisionInstructionViewProps = AddProps | DeleteProps | UpdateProps;

const RevisionSubcategoryView = (props: RevisionInstructionViewProps) =>
  props.op === "added" ? (
    <AddedFrameworkNode content={<SubcategoryContentView id={props.subcategory.id} name={props.subcategory.name} />} />
  ) : props.op === "deleted" ? (
    <DeletedFrameworkNode
      content={<SubcategoryContentView id={props.subcategory.id} name={props.subcategory.name} />}
    />
  ) : props.op === "updated" ? (
    <UpdatedFrameworkNode
      before={<SubcategoryContentView id={props.before.id} name={props.before.name} />}
      after={<SubcategoryContentView id={props.after.id} name={props.after.name} />}
    />
  ) : null;

export default RevisionSubcategoryView;
