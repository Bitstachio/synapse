import AddedFrameworkNode from "@/components/framework-nodes/revision-nodes/AddedFrameworkNode/AddedFrameworkNode";
import DeletedFrameworkNode from "@/components/framework-nodes/revision-nodes/DeletedFrameworkNode/DeletedFrameworkNode";
import UpdatedFrameworkNode from "@/components/framework-nodes/revision-nodes/UpdatedFrameworkNode/UpdatedFrameworkNode";
import { Category } from "@/types/framework";
import { ReactNode } from "react";
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

type RevisionCategoryViewProps = (AddProps | DeleteProps | UpdateProps) & { children?: ReactNode };

const RevisionCategoryView = (props: RevisionCategoryViewProps) =>
  props.op === "added" ? (
    <AddedFrameworkNode
      content={
        <CategoryContentView
          id={props.category.id}
          name={props.category.name}
          description={props.category.description}
        />
      }
    >
      {props.children}
    </AddedFrameworkNode>
  ) : props.op === "deleted" ? (
    <DeletedFrameworkNode
      content={
        <CategoryContentView
          id={props.category.id}
          name={props.category.name}
          description={props.category.description}
        />
      }
    >
      {props.children}
    </DeletedFrameworkNode>
  ) : props.op === "updated" ? (
    <UpdatedFrameworkNode
      before={
        <CategoryContentView id={props.before.id} name={props.before.name} description={props.before.description} />
      }
      after={<CategoryContentView id={props.after.id} name={props.after.name} description={props.after.description} />}
    >
      {props.children}
    </UpdatedFrameworkNode>
  ) : null;

export default RevisionCategoryView;
