import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { RequestContext } from './utilities';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  JSON: any;
  Void: any;
};

export type Bookmark = {
  __typename?: 'Bookmark';
  aliases: Array<BookmarkAlias>;
  category: Category;
  categoryId: Scalars['Int'];
  createdAt: Scalars['Date'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  modifiedAt: Scalars['Date'];
  tags: Array<Tag>;
  title: Scalars['String'];
  url: Scalars['String'];
};

export type BookmarkAlias = {
  __typename?: 'BookmarkAlias';
  bookmark: Bookmark;
  createdAt: Scalars['Date'];
  id: Scalars['Int'];
  modifiedAt: Scalars['Date'];
  url: Scalars['String'];
};

export type Category = {
  __typename?: 'Category';
  createdAt: Scalars['Date'];
  id: Scalars['Int'];
  isActive: Scalars['Boolean'];
  isAdmin: Scalars['Boolean'];
  modifiedAt: Scalars['Date'];
  name: Scalars['String'];
  rules: Array<CategoryPatternAlias>;
  users: Array<UserCategory>;
};

export type CategoryPatternAlias = {
  __typename?: 'CategoryPatternAlias';
  canonical: Scalars['String'];
  category: Category;
  categoryId: Scalars['Int'];
  createdAt: Scalars['Date'];
  id: Scalars['Int'];
  match: Scalars['String'];
  modifiedAt: Scalars['Date'];
  origin: Scalars['String'];
};

export type CreateBookmarkContent = {
  categoryId: Scalars['Int'];
  description?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Scalars['String']>>;
  title: Scalars['String'];
  url: Scalars['String'];
};

export type CreateCategoryAliasContent = {
  canonical: Scalars['String'];
  match: Scalars['String'];
  origin: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addBookmark?: Maybe<Bookmark>;
  addCategory?: Maybe<Category>;
  addCategoryPatternAlias?: Maybe<Scalars['Void']>;
  addTag?: Maybe<Scalars['Void']>;
  addUsers?: Maybe<Scalars['Void']>;
  batchUpdateHostName?: Maybe<Scalars['Void']>;
  joinCategory?: Maybe<Scalars['Void']>;
  leaveCategory?: Maybe<Scalars['Void']>;
  login: Scalars['String'];
  removeBookmark?: Maybe<Scalars['Void']>;
  removeCategoryPatternAlias?: Maybe<Scalars['Void']>;
  removeTag?: Maybe<Scalars['Void']>;
  removeUser?: Maybe<Scalars['Void']>;
  updateBookmark?: Maybe<Scalars['Void']>;
  updateCategory?: Maybe<Scalars['Void']>;
  updateCategoryPatternAlias?: Maybe<Scalars['Void']>;
};


export type MutationAddBookmarkArgs = {
  input: CreateBookmarkContent;
};


export type MutationAddCategoryArgs = {
  name: Scalars['String'];
};


export type MutationAddCategoryPatternAliasArgs = {
  categoryId: Scalars['Int'];
  input: CreateCategoryAliasContent;
};


export type MutationAddTagArgs = {
  bookmarkId: Scalars['Int'];
  name: Scalars['String'];
};


export type MutationAddUsersArgs = {
  categoryId: Scalars['Int'];
  emails: Array<Scalars['String']>;
};


export type MutationBatchUpdateHostNameArgs = {
  categoryId: Scalars['Int'];
  newName: Scalars['String'];
  oldName: Scalars['String'];
};


export type MutationJoinCategoryArgs = {
  id: Scalars['Int'];
};


export type MutationLeaveCategoryArgs = {
  id: Scalars['Int'];
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationRemoveBookmarkArgs = {
  id: Scalars['Int'];
};


export type MutationRemoveCategoryPatternAliasArgs = {
  id: Scalars['Int'];
};


export type MutationRemoveTagArgs = {
  bookmarkId: Scalars['Int'];
  name: Scalars['String'];
};


export type MutationRemoveUserArgs = {
  categoryId: Scalars['Int'];
  id: Scalars['Int'];
};


export type MutationUpdateBookmarkArgs = {
  bookmarkId: Scalars['Int'];
  input: UpdateBookmarkContent;
};


export type MutationUpdateCategoryArgs = {
  id: Scalars['Int'];
  input?: Maybe<UpdateCategoryContent>;
};


export type MutationUpdateCategoryPatternAliasArgs = {
  id: Scalars['Int'];
  input: UpdateCategoryAliasContent;
};

export type Query = {
  __typename?: 'Query';
  bookmark?: Maybe<Bookmark>;
  bookmarks: Array<Bookmark>;
  bookmarksForUrl: Array<Bookmark>;
  categories: Array<Category>;
  category?: Maybe<Category>;
  isBookmarked?: Maybe<Scalars['Boolean']>;
  tags: Array<Tag>;
  users: Array<UserCategory>;
};


export type QueryBookmarkArgs = {
  id: Scalars['Int'];
};


export type QueryBookmarksArgs = {
  categoryId: Scalars['Int'];
  orderBy?: Maybe<Scalars['JSON']>;
  skip?: Maybe<Scalars['Int']>;
  take?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};


export type QueryBookmarksForUrlArgs = {
  url: Scalars['String'];
};


export type QueryCategoriesArgs = {
  activeOnly?: Maybe<Scalars['Boolean']>;
  skip?: Maybe<Scalars['Int']>;
  take?: Maybe<Scalars['Int']>;
};


export type QueryCategoryArgs = {
  id: Scalars['Int'];
};


export type QueryIsBookmarkedArgs = {
  url: Scalars['String'];
};


export type QueryTagsArgs = {
  categoryId: Scalars['Int'];
  skip?: Maybe<Scalars['Int']>;
  take?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};


export type QueryUsersArgs = {
  categoryId: Scalars['Int'];
};

export type Tag = {
  __typename?: 'Tag';
  bookmark: Bookmark;
  category: Category;
  categoryId: Scalars['Int'];
  createdAt: Scalars['Date'];
  createdBy: User;
  createdByCurrentUser: Scalars['Boolean'];
  createdById: Scalars['Int'];
  id: Scalars['Int'];
  modifiedAt: Scalars['Date'];
  name: Scalars['String'];
};

export type UpdateBookmarkContent = {
  aliases?: Maybe<Array<Scalars['String']>>;
  description?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Scalars['String']>>;
  title?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

export type UpdateCategoryAliasContent = {
  canonical?: Maybe<Scalars['String']>;
  match?: Maybe<Scalars['String']>;
  origin?: Maybe<Scalars['String']>;
};

export type UpdateCategoryContent = {
  title?: Maybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['Date'];
  email: Scalars['String'];
  id: Scalars['Int'];
  modifiedAt: Scalars['Date'];
};

export type UserCategory = {
  __typename?: 'UserCategory';
  active: Scalars['Boolean'];
  admin: Scalars['Boolean'];
  createdAt: Scalars['Date'];
  id: Scalars['Int'];
  modifiedAt: Scalars['Date'];
  user: User;
};



export type ResolverTypeWrapper<T> = T extends Record<string, any> ? (Promise<Partial<T>> | Partial<T>) : T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Bookmark: ResolverTypeWrapper<Bookmark>;
  BookmarkAlias: ResolverTypeWrapper<BookmarkAlias>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Category: ResolverTypeWrapper<Category>;
  CategoryPatternAlias: ResolverTypeWrapper<CategoryPatternAlias>;
  CreateBookmarkContent: CreateBookmarkContent;
  CreateCategoryAliasContent: CreateCategoryAliasContent;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Tag: ResolverTypeWrapper<Tag>;
  UpdateBookmarkContent: UpdateBookmarkContent;
  UpdateCategoryAliasContent: UpdateCategoryAliasContent;
  UpdateCategoryContent: UpdateCategoryContent;
  User: ResolverTypeWrapper<User>;
  UserCategory: ResolverTypeWrapper<UserCategory>;
  Void: ResolverTypeWrapper<Scalars['Void']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Bookmark: Bookmark;
  BookmarkAlias: BookmarkAlias;
  Boolean: Scalars['Boolean'];
  Category: Category;
  CategoryPatternAlias: CategoryPatternAlias;
  CreateBookmarkContent: CreateBookmarkContent;
  CreateCategoryAliasContent: CreateCategoryAliasContent;
  Date: Scalars['Date'];
  Int: Scalars['Int'];
  JSON: Scalars['JSON'];
  Mutation: {};
  Query: {};
  String: Scalars['String'];
  Tag: Tag;
  UpdateBookmarkContent: UpdateBookmarkContent;
  UpdateCategoryAliasContent: UpdateCategoryAliasContent;
  UpdateCategoryContent: UpdateCategoryContent;
  User: User;
  UserCategory: UserCategory;
  Void: Scalars['Void'];
};

export type BookmarkResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['Bookmark'] = ResolversParentTypes['Bookmark']> = {
  aliases?: Resolver<Array<ResolversTypes['BookmarkAlias']>, ParentType, ContextType>;
  category?: Resolver<ResolversTypes['Category'], ParentType, ContextType>;
  categoryId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  modifiedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes['Tag']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BookmarkAliasResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['BookmarkAlias'] = ResolversParentTypes['BookmarkAlias']> = {
  bookmark?: Resolver<ResolversTypes['Bookmark'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  modifiedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CategoryResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['Category'] = ResolversParentTypes['Category']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isAdmin?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  modifiedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rules?: Resolver<Array<ResolversTypes['CategoryPatternAlias']>, ParentType, ContextType>;
  users?: Resolver<Array<ResolversTypes['UserCategory']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CategoryPatternAliasResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['CategoryPatternAlias'] = ResolversParentTypes['CategoryPatternAlias']> = {
  canonical?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  category?: Resolver<ResolversTypes['Category'], ParentType, ContextType>;
  categoryId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  match?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  modifiedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  origin?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type MutationResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addBookmark?: Resolver<Maybe<ResolversTypes['Bookmark']>, ParentType, ContextType, RequireFields<MutationAddBookmarkArgs, 'input'>>;
  addCategory?: Resolver<Maybe<ResolversTypes['Category']>, ParentType, ContextType, RequireFields<MutationAddCategoryArgs, 'name'>>;
  addCategoryPatternAlias?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationAddCategoryPatternAliasArgs, 'categoryId' | 'input'>>;
  addTag?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationAddTagArgs, 'bookmarkId' | 'name'>>;
  addUsers?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationAddUsersArgs, 'categoryId' | 'emails'>>;
  batchUpdateHostName?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationBatchUpdateHostNameArgs, 'categoryId' | 'newName' | 'oldName'>>;
  joinCategory?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationJoinCategoryArgs, 'id'>>;
  leaveCategory?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationLeaveCategoryArgs, 'id'>>;
  login?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  removeBookmark?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationRemoveBookmarkArgs, 'id'>>;
  removeCategoryPatternAlias?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationRemoveCategoryPatternAliasArgs, 'id'>>;
  removeTag?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationRemoveTagArgs, 'bookmarkId' | 'name'>>;
  removeUser?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationRemoveUserArgs, 'categoryId' | 'id'>>;
  updateBookmark?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationUpdateBookmarkArgs, 'bookmarkId' | 'input'>>;
  updateCategory?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationUpdateCategoryArgs, 'id'>>;
  updateCategoryPatternAlias?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationUpdateCategoryPatternAliasArgs, 'id' | 'input'>>;
};

export type QueryResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  bookmark?: Resolver<Maybe<ResolversTypes['Bookmark']>, ParentType, ContextType, RequireFields<QueryBookmarkArgs, 'id'>>;
  bookmarks?: Resolver<Array<ResolversTypes['Bookmark']>, ParentType, ContextType, RequireFields<QueryBookmarksArgs, 'categoryId'>>;
  bookmarksForUrl?: Resolver<Array<ResolversTypes['Bookmark']>, ParentType, ContextType, RequireFields<QueryBookmarksForUrlArgs, 'url'>>;
  categories?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType, RequireFields<QueryCategoriesArgs, never>>;
  category?: Resolver<Maybe<ResolversTypes['Category']>, ParentType, ContextType, RequireFields<QueryCategoryArgs, 'id'>>;
  isBookmarked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<QueryIsBookmarkedArgs, 'url'>>;
  tags?: Resolver<Array<ResolversTypes['Tag']>, ParentType, ContextType, RequireFields<QueryTagsArgs, 'categoryId'>>;
  users?: Resolver<Array<ResolversTypes['UserCategory']>, ParentType, ContextType, RequireFields<QueryUsersArgs, 'categoryId'>>;
};

export type TagResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['Tag'] = ResolversParentTypes['Tag']> = {
  bookmark?: Resolver<ResolversTypes['Bookmark'], ParentType, ContextType>;
  category?: Resolver<ResolversTypes['Category'], ParentType, ContextType>;
  categoryId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  createdByCurrentUser?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createdById?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  modifiedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  modifiedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserCategoryResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['UserCategory'] = ResolversParentTypes['UserCategory']> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  admin?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  modifiedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface VoidScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Void'], any> {
  name: 'Void';
}

export type Resolvers<ContextType = RequestContext> = {
  Bookmark?: BookmarkResolvers<ContextType>;
  BookmarkAlias?: BookmarkAliasResolvers<ContextType>;
  Category?: CategoryResolvers<ContextType>;
  CategoryPatternAlias?: CategoryPatternAliasResolvers<ContextType>;
  Date?: GraphQLScalarType;
  JSON?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Tag?: TagResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserCategory?: UserCategoryResolvers<ContextType>;
  Void?: GraphQLScalarType;
};

