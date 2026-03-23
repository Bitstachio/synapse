import AddedFrameworkNode from "@/components/framework-nodes/revision-nodes/AddedFrameworkNode/AddedFrameworkNode";
import DeletedFrameworkNode from "@/components/framework-nodes/revision-nodes/DeletedFrameworkNode/DeletedFrameworkNode";
import UpdatedFrameworkNode from "@/components/framework-nodes/revision-nodes/UpdatedFrameworkNode/UpdatedFrameworkNode";
import { Category } from "@/types/framework";
import CategoryContentView from "../CategoryContentView/CategoryContentView";

type AddProps = {
  op: "added";
  category: Category;
};

type DeleteProps = {
  op: "deleted";
  category: Category;
};

type UpdateProps = {
  op: "updated";
  before: Category;
  after: Category;
};

type RevisionInstructionViewProps = AddProps | DeleteProps | UpdateProps;

const RevisionCategoryView = (props: RevisionInstructionViewProps) =>
  props.op === "added" ? (
    <AddedFrameworkNode
      content={
        <CategoryContentView
          id={props.category.id}
          name={props.category.name}
          description={props.category.description}
        />
      }
    />
  ) : props.op === "deleted" ? (
    <DeletedFrameworkNode
      content={
        <CategoryContentView
          id={props.category.id}
          name={props.category.name}
          description={props.category.description}
        />
      }
    />
  ) : props.op === "updated" ? (
    <UpdatedFrameworkNode
      before={
        <CategoryContentView id={props.before.id} name={props.before.name} description={props.before.description} />
      }
      after={<CategoryContentView id={props.after.id} name={props.after.name} description={props.after.description} />}
    />
  ) : null;

export default RevisionCategoryView;
